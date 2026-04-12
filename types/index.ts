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
  login: (user: User, accessToken: string, refreshToken?: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export interface CourseState {
  courses: Course[];
  bookmarks: number[];
  enrolled: number[];
  loading: boolean;
  error: string | null;
  fetchCourses: () => Promise<void>;
  /** Persists to AsyncStorage; syncs to server when online and authenticated */
  toggleBookmark: (id: number) => Promise<void>;
  enrollInCourse: (id: number) => Promise<void>;
  resetStore: () => Promise<void>;
  /** After login / cold start with token: merge server + local bookmark/enrolled lists */
  mergeRemoteProgressAfterLogin: () => Promise<void>;
}
