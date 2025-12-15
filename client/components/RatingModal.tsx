"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Star } from "lucide-react";
import axios from "axios";

interface RatingModalProps {
    reservation: any;
    isOpen: boolean;
    onClose: () => void;
    onRatingSubmit: () => void;
}

export default function RatingModal({ reservation, isOpen, onClose, onRatingSubmit }: RatingModalProps) {
    const { data: session } = useSession();
    const [rating, setRating] = useState(0);
    const [review, setReview] = useState("");
    const [hover, setHover] = useState(0);
    const [loading, setLoading] = useState(false);
    const [userRating, setUserRating] = useState<any>(null);

    useEffect(() => {
        if (isOpen && session?.accessToken) {
            fetchUserRating();
        }
    }, [isOpen, reservation]);

    const fetchUserRating = async () => {
        try {
            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/ratings/reservation/${reservation.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                }
            );
            setUserRating(response.data);
            if (response.data) {
                setRating(response.data.rating);
                setReview(response.data.review || "");
            }
        } catch (error) {
            console.error("Error fetching user rating:", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!rating) return;

        setLoading(true);
        try {
            const payload = {
                reservationId: reservation.id,
                facilityId: reservation.facilityId || reservation.facility_id,
                rating,
                review: review || undefined
            };

            // Check if updating or creating
            if (userRating) {
                // For update, we would need a PUT endpoint, but for now just show message
                alert("You've already rated this reservation. Rating updates are not currently supported.");
                return;
            }

            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/ratings`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${session?.accessToken}`
                    }
                }
            );

            onRatingSubmit();
            onClose();
        } catch (error: any) {
            console.error("Error submitting rating:", error);
            alert(error.response?.data?.message || "Error submitting rating");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Rate Your Experience</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <span className="text-2xl">&times;</span>
                        </button>
                    </div>

                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Facility: {reservation.facilityName}</p>
                        <p className="text-sm text-gray-600 mb-2">Date: {reservation.date}</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Rating
                            </label>
                            <div className="flex space-x-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        className={`text-2xl ${star <= (hover || rating) ? "text-yellow-400" : "text-gray-300"}`}
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHover(star)}
                                        onMouseLeave={() => setHover(0)}
                                    >
                                        <Star fill={star <= (hover || rating) ? "currentColor" : "none"} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="review" className="block text-sm font-medium text-gray-700 mb-2">
                                Your Review (Optional)
                            </label>
                            <textarea
                                id="review"
                                rows={3}
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                value={review}
                                onChange={(e) => setReview(e.target.value)}
                                placeholder="Share your experience with this facility..."
                            />
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || rating === 0}
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {loading ? "Submitting..." : "Submit Rating"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}