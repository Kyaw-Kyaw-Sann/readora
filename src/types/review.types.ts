export interface ReviewUser {
  id: number;
  name: string;
  profileImageUrl: string | null;
}

export interface Review {
  id: number;
  bookId: number;
  user: ReviewUser;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewRequest {
  rating: number;
  comment?: string;
}

export interface ReviewSummary {
  averageRating: number;
  reviewCount: number;
}
