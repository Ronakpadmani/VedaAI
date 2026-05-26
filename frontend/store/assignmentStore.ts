import { create } from "zustand";
import { api } from "@/lib/api";
import type { Assignment, JobProgressEvent, QuestionTypeRow } from "@/lib/types";

const DEFAULT_QUESTION_TYPES: QuestionTypeRow[] = [
  { id: "1", type: "Multiple Choice Questions", count: 5, marksPerQuestion: 1 },
  { id: "2", type: "Short Questions", count: 10, marksPerQuestion: 2 },
  {
    id: "3",
    type: "Diagram/Graph-Based Questions",
    count: 5,
    marksPerQuestion: 3,
  },
  { id: "4", type: "Numerical Problems", count: 5, marksPerQuestion: 4 },
];

interface CreateFormState {
  title: string;
  dueDate: string;
  questionTypes: QuestionTypeRow[];
  additionalInfo: string;
  file: File | null;
  errors: Record<string, string>;
}

interface AssignmentStore {
  assignments: Assignment[];
  loading: boolean;
  currentAssignment: Assignment | null;
  form: CreateFormState;
  generationProgress: number;
  generationMessage: string;

  fetchAssignments: () => Promise<void>;
  fetchAssignment: (id: string) => Promise<void>;
  setFormField: <K extends keyof CreateFormState>(
    key: K,
    value: CreateFormState[K]
  ) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (
    id: string,
    field: keyof QuestionTypeRow,
    value: string | number
  ) => void;
  validateForm: () => boolean;
  resetForm: () => void;
  submitAssignment: () => Promise<string>;
  startGeneration: (id: string) => Promise<void>;
  regenerate: (id: string) => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;
  handleProgress: (event: JobProgressEvent) => void;
  getTotals: () => { totalQuestions: number; totalMarks: number };
}

const initialForm: CreateFormState = {
  title: "",
  dueDate: "",
  questionTypes: DEFAULT_QUESTION_TYPES.map((q) => ({ ...q })),
  additionalInfo: "",
  file: null,
  errors: {},
};

export const useAssignmentStore = create<AssignmentStore>((set, get) => ({
  assignments: [],
  loading: false,
  currentAssignment: null,
  form: { ...initialForm },
  generationProgress: 0,
  generationMessage: "",

  fetchAssignments: async () => {
    set({ loading: true });
    try {
      const assignments = await api.getAssignments();
      set({ assignments, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchAssignment: async (id: string) => {
    set({ loading: true });
    try {
      const currentAssignment = await api.getAssignment(id);
      set({ currentAssignment, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  setFormField: (key, value) => {
    set((state) => ({
      form: { ...state.form, [key]: value, errors: { ...state.form.errors, [key]: "" } },
    }));
  },

  addQuestionType: () => {
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: [
          ...state.form.questionTypes,
          {
            id: crypto.randomUUID(),
            type: "Short Questions",
            count: 1,
            marksPerQuestion: 2,
          },
        ],
      },
    }));
  },

  removeQuestionType: (id) => {
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: state.form.questionTypes.filter((q) => q.id !== id),
      },
    }));
  },

  updateQuestionType: (id, field, value) => {
    set((state) => ({
      form: {
        ...state.form,
        questionTypes: state.form.questionTypes.map((q) =>
          q.id === id ? { ...q, [field]: value } : q
        ),
      },
    }));
  },

  validateForm: () => {
    const { form } = get();
    const errors: Record<string, string> = {};

    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.dueDate) errors.dueDate = "Due date is required";
    if (form.questionTypes.length === 0) {
      errors.questionTypes = "Add at least one question type";
    }

    for (const qt of form.questionTypes) {
      if (!qt.type.trim()) {
        errors.questionTypes = "Question type cannot be empty";
        break;
      }
      if (qt.count <= 0) {
        errors.questionTypes = "Number of questions must be positive";
        break;
      }
      if (qt.marksPerQuestion <= 0) {
        errors.questionTypes = "Marks must be positive";
        break;
      }
    }

    set((state) => ({ form: { ...state.form, errors } }));
    return Object.keys(errors).length === 0;
  },

  resetForm: () => set({ form: { ...initialForm, questionTypes: DEFAULT_QUESTION_TYPES.map((q) => ({ ...q })) } }),

  submitAssignment: async () => {
    if (!get().validateForm()) {
      throw new Error("Validation failed");
    }

    const { form } = get();
    const formData = new FormData();
    formData.append("title", form.title.trim());
    formData.append("dueDate", form.dueDate);
    formData.append(
      "questionTypes",
      JSON.stringify(
        form.questionTypes.map(({ type, count, marksPerQuestion }) => ({
          type,
          count,
          marksPerQuestion,
        }))
      )
    );
    if (form.additionalInfo) {
      formData.append("additionalInfo", form.additionalInfo);
    }
    if (form.file) {
      formData.append("file", form.file);
    }

    const assignment = await api.createAssignment(formData);
    set((state) => ({
      assignments: [assignment, ...state.assignments],
    }));
    await get().startGeneration(assignment._id);
    return assignment._id;
  },

  startGeneration: async (id: string) => {
    set({ generationProgress: 0, generationMessage: "Starting generation..." });
    await api.generate(id);
  },

  regenerate: async (id: string) => {
    set({ generationProgress: 0, generationMessage: "Regenerating..." });
    await api.regenerate(id);
  },

  deleteAssignment: async (id: string) => {
    await api.deleteAssignment(id);
    set((state) => ({
      assignments: state.assignments.filter((a) => a._id !== id),
    }));
  },

  handleProgress: (event: JobProgressEvent) => {
    set({
      generationProgress: event.progress,
      generationMessage: event.message,
    });

    if (event.questionPaper) {
      set((state) => ({
        currentAssignment: state.currentAssignment
          ? {
              ...state.currentAssignment,
              status: event.status,
              questionPaper: event.questionPaper,
              progress: event.progress,
              progressMessage: event.message,
            }
          : null,
      }));
    } else {
      set((state) => ({
        currentAssignment: state.currentAssignment
          ? {
              ...state.currentAssignment,
              status: event.status,
              progress: event.progress,
              progressMessage: event.message,
              error: event.error,
            }
          : null,
      }));
    }
  },

  getTotals: () => {
    const { questionTypes } = get().form;
    return {
      totalQuestions: questionTypes.reduce((s, q) => s + q.count, 0),
      totalMarks: questionTypes.reduce(
        (s, q) => s + q.count * q.marksPerQuestion,
        0
      ),
    };
  },
}));
