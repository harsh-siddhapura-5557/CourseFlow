export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Instructor {
  id: number;
  name: {
    first: string;
    last: string;
  };
  picture: {
    medium: string;
  };
  email: string;
}

export interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  instructor?: Instructor;
  duration?: string;
  lessons?: number;
  students?: string;
  rating?: number;
  reviewsCount?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  login: (user: User, token: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateAvatar: (avatar: string) => Promise<void>;
}

export interface CourseState {
  courses: Course[];
  bookmarks: number[];
  enrolled: number[];
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  toggleBookmark: (id: number) => void;
  enrollInCourse: (id: number) => void;
  resetStore: () => Promise<void>;
}
