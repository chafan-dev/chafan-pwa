import { CreateArticle, FollowUser, IActivity, UpvoteAnswer, UpvoteQuestion, UpvoteSubmission } from '@/interfaces/index';

import dayjs from '@/dayjs';

export const combinedActivities = (activities: IActivity[]) => {
    const questionUpvotes = new Map<string, IActivity[]>();
    const submissionUpvotes = new Map<string, IActivity[]>();
    const answerUpvotes = new Map<string, IActivity[]>();
    const createArticles = new Map<string, IActivity[]>();
    const followUsers = new Map<string, IActivity[]>();
    const newActivities: IActivity[] = [];

    for (const activity of activities) {
        if (activity.verb === 'upvote_question') {
            const q = (activity.event.content as UpvoteQuestion).question;
            if (!questionUpvotes.has(q.uuid)) {
                questionUpvotes.set(q.uuid, []);
            }
            questionUpvotes.get(q.uuid)!.push(activity);
        } else if (activity.verb === 'upvote_submission') {
            const q = (activity.event.content as UpvoteSubmission).submission;
            if (!submissionUpvotes.has(q.uuid)) {
                submissionUpvotes.set(q.uuid, []);
            }
            submissionUpvotes.get(q.uuid)!.push(activity);
        } else if (activity.verb === 'upvote_answer') {
            const answer = (activity.event.content as UpvoteAnswer).answer;
            if (!answerUpvotes.has(answer.uuid)) {
                answerUpvotes.set(answer.uuid, []);
            }
            answerUpvotes.get(answer.uuid)!.push(activity);
        } else if (activity.verb === 'create_article') {
            const article = (activity.event.content as CreateArticle).article;
            if (!createArticles.has(article.uuid)) {
                createArticles.set(article.uuid, []);
            }
            createArticles.get(article.uuid)!.push(activity);
        } else if (activity.verb === 'follow_user') {
            const user = (activity.event.content as FollowUser).user;
            if (!followUsers.has(user.uuid)) {
                followUsers.set(user.uuid, []);
            }
            followUsers.get(user.uuid)!.push(activity);
        } else {
            newActivities.push(activity);
        }
    }

    questionUpvotes.forEach((v, k, map) => {
        if (v.length > 1) {
            newActivities.push({
                id: v[0].id,
                created_at: v[0].created_at,
                site_uuid: v[0].site_uuid,
                verb: 'upvote_question_combined',
                event: {
                    created_at: v[0].created_at,
                    content: {
                        verb: 'upvote_question_combined',
                        subjects: v.map((a) => (a.event.content as UpvoteQuestion).subject),
                        question: (v[0].event.content as UpvoteQuestion).question,
                    },
                },
            });
        } else {
            newActivities.push(v[0]);
        }
    });

    submissionUpvotes.forEach((v, k, map) => {
        if (v.length > 1) {
            newActivities.push({
                id: v[0].id,
                created_at: v[0].created_at,
                site_uuid: v[0].site_uuid,
                verb: 'upvote_submission_combined',
                event: {
                    created_at: v[0].created_at,
                    content: {
                        verb: 'upvote_submission_combined',
                        subjects: v.map((a) => (a.event.content as UpvoteSubmission).subject),
                        submission: (v[0].event.content as UpvoteSubmission).submission,
                    },
                },
            });
        } else {
            newActivities.push(v[0]);
        }
    });

    answerUpvotes.forEach((v, k, map) => {
        if (v.length > 1) {
            newActivities.push({
                id: v[0].id,
                created_at: v[0].created_at,
                site_uuid: v[0].site_uuid,
                verb: 'upvote_answer_combined',
                event: {
                    created_at: v[0].created_at,
                    content: {
                        verb: 'upvote_answer_combined',
                        subjects: v.map((a) => (a.event.content as UpvoteAnswer).subject),
                        answer: (v[0].event.content as UpvoteAnswer).answer,
                    },
                },
            });
        } else {
            newActivities.push(v[0]);
        }
    });

    followUsers.forEach((v, k, map) => {
        if (v.length > 1) {
            newActivities.push({
                id: v[0].id,
                created_at: v[0].created_at,
                site_uuid: v[0].site_uuid,
                verb: 'follow_user_combined',
                event: {
                    created_at: v[0].created_at,
                    content: {
                        verb: 'follow_user_combined',
                        subjects: v.map((a) => (a.event.content as FollowUser).subject),
                        user: (v[0].event.content as FollowUser).user,
                    },
                },
            });
        } else {
            newActivities.push(v[0]);
        }
    });

    // Combine repeated publish/unpublish/publish event.
    createArticles.forEach((v, k, map) => {
        newActivities.push(v[0]);
    });

    return newActivities.sort((a, b) => {
        return - (dayjs as any).utc(a.created_at).diff((dayjs as any).utc(b.created_at));
    });
};
