"use client";
import { MuiButton } from "@/components/ui/MuiFormControls";

import { useCallback, useEffect, useState } from "react";

import { useToast } from "@/components/providers/ToastProvider";
import Loading from "@/components/ui/Loading";
import StatusBadge from "@/components/ui/StatusBadge";

export default function ReviewsManager() {
  const [reviews, setReviews] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingAction, setLoadingAction] = useState(null);

  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      const [reviewsResponse, questionsResponse] =
        await Promise.all([
          fetch("/api/admin/reviews", {
            cache: "no-store",
          }),
          fetch("/api/admin/questions", {
            cache: "no-store",
          }),
        ]);

      const [reviewsData, questionsData] =
        await Promise.all([
          reviewsResponse.json(),
          questionsResponse.json(),
        ]);

      if (!reviewsResponse.ok) {
        throw new Error(
          reviewsData?.error ||
            reviewsData?.message ||
            "Unable to load reviews"
        );
      }

      if (!questionsResponse.ok) {
        throw new Error(
          questionsData?.error ||
            questionsData?.message ||
            "Unable to load questions"
        );
      }

      setReviews(
        Array.isArray(reviewsData?.items)
          ? reviewsData.items
          : []
      );

      setQuestions(
        Array.isArray(questionsData?.items)
          ? questionsData.items
          : []
      );
    } catch (error) {
      console.error(
        "Unable to load reviews/questions:",
        error
      );

      setReviews([]);
      setQuestions([]);

      toast(
        error?.message ||
          "Unable to load reviews and questions",
        "error"
      );
    }
  }, [toast]);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [reviewsResponse, questionsResponse] =
          await Promise.all([
            fetch("/api/admin/reviews", {
              cache: "no-store",
            }),
            fetch("/api/admin/questions", {
              cache: "no-store",
            }),
          ]);

        const [reviewsData, questionsData] =
          await Promise.all([
            reviewsResponse.json(),
            questionsResponse.json(),
          ]);

        if (cancelled) {
          return;
        }

        if (!reviewsResponse.ok) {
          throw new Error(
            reviewsData?.error ||
              reviewsData?.message ||
              "Unable to load reviews"
          );
        }

        if (!questionsResponse.ok) {
          throw new Error(
            questionsData?.error ||
              questionsData?.message ||
              "Unable to load questions"
          );
        }

        setReviews(
          Array.isArray(reviewsData?.items)
            ? reviewsData.items
            : []
        );

        setQuestions(
          Array.isArray(questionsData?.items)
            ? questionsData.items
            : []
        );
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to load reviews/questions:",
          error
        );

        setReviews([]);
        setQuestions([]);

        toast(
          error?.message ||
            "Unable to load reviews and questions",
          "error"
        );
      }
    }

    fetchData();

    return () => {
      cancelled = true;
    };
  }, [toast]);

  async function moderate(id, status) {
    try {
      setLoadingAction(`review:${id}:${status}`);

      const response = await fetch(
        "/api/admin/reviews",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Moderation failed"
        );
      }

      toast(
        `Review ${status}`,
        "success"
      );

      await loadData();
    } catch (error) {
      toast(
        error?.message ||
          "Moderation failed",
        "error"
      );
    } finally {
      setLoadingAction(null);
    }
  }

  async function answer(id) {
    const answerText = window.prompt(
      "Staff answer"
    );

    if (!answerText?.trim()) {
      return;
    }

    try {
      setLoadingAction(`question:${id}`);

      const response = await fetch(
        "/api/admin/questions",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            answer: answerText.trim(),
            status: "published",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            "Unable to answer"
        );
      }

      toast(
        "Answer published",
        "success"
      );

      await loadData();
    } catch (error) {
      toast(
        error?.message ||
          "Unable to answer",
        "error"
      );
    } finally {
      setLoadingAction(null);
    }
  }

  if (reviews === null) {
    return <Loading />;
  }

  return (
    <>
      <div className="data-card">
        <div className="data-card-head">
          <strong>
            Product reviews
          </strong>

          <span>
            {reviews.length}
          </span>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Customer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Flags</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>

            <tbody>
              {reviews.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    style={{
                      textAlign: "center",
                      padding: 24,
                    }}
                  >
                    No reviews found.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => {
                  const approving =
                    loadingAction ===
                    `review:${review._id}:approved`;

                  const rejecting =
                    loadingAction ===
                    `review:${review._id}:rejected`;

                  return (
                    <tr key={review._id}>
                      <td>
                        {review.product?.name ||
                          "Unknown product"}
                      </td>

                      <td>
                        {review.user?.name ||
                          "Unknown customer"}

                        <br />

                        <span className="muted">
                          {review.user?.email || ""}
                        </span>
                      </td>

                      <td>
                        {review.rating}★
                      </td>

                      <td>
                        {review.title ||
                          review.body?.slice(0, 80) ||
                          "—"}
                      </td>

                      <td>
                        {review.reports?.length || 0}
                      </td>

                      <td>
                        <StatusBadge
                          value={review.status}
                        />
                      </td>

                      <td>
                        <MuiButton
                          type="button"
                          className="link-button"
                          disabled={
                            approving ||
                            rejecting
                          }
                          onClick={() =>
                            moderate(
                              review._id,
                              "approved"
                            )
                          }
                        >
                          {approving
                            ? "Approving..."
                            : "Approve"}
                        </MuiButton>

                        {" · "}

                        <MuiButton
                          type="button"
                          className="link-button"
                          disabled={
                            approving ||
                            rejecting
                          }
                          onClick={() =>
                            moderate(
                              review._id,
                              "rejected"
                            )
                          }
                        >
                          {rejecting
                            ? "Rejecting..."
                            : "Reject"}
                        </MuiButton>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="data-card">
        <div className="data-card-head">
          <strong>
            Product questions & answers
          </strong>

          <span>
            {questions.length}
          </span>
        </div>

        {questions.length === 0 ? (
          <div
            style={{
              padding: 24,
            }}
          >
            <p className="muted">
              No questions found.
            </p>
          </div>
        ) : (
          questions.map((question) => {
            const answering =
              loadingAction ===
              `question:${question._id}`;

            return (
              <div
                key={question._id}
                style={{
                  padding: 18,
                  borderBottom:
                    "1px solid #eee",
                }}
              >
                <span className="eyebrow">
                  {question.product?.name ||
                    "Unknown product"}
                  {" · "}
                  {question.status}
                </span>

                <h3>
                  {question.question}
                </h3>

                <p className="muted">
                  Asked by{" "}
                  {question.user?.name ||
                    "Unknown customer"}
                </p>

                {(question.answers || []).map(
                  (answerItem, index) => (
                    <blockquote
                      key={
                        answerItem._id ||
                        `${question._id}-${index}`
                      }
                      style={{
                        borderLeft:
                          "3px solid var(--acid)",
                        paddingLeft: 12,
                      }}
                    >
                      {answerItem.body}
                    </blockquote>
                  )
                )}

                <MuiButton
                  type="button"
                  className="button small"
                  disabled={answering}
                  onClick={() =>
                    answer(question._id)
                  }
                >
                  {answering
                    ? "Publishing..."
                    : "Answer & publish"}
                </MuiButton>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}