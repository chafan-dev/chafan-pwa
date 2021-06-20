import {
  AnswerQuestion,
  CreateArticle,
  CreateQuestion,
  FollowUser,
  IActivity,
  UpvoteAnswer,
  UpvoteArticle,
  UpvoteQuestion,
  UpvoteSubmission,
} from '@/interfaces/index';

export class CombinedActivities {
  public items: IActivity[] = [];
  public maxActivityId: number | null = null;
  public minActivityId: number | null = null;

  public add(newActivity: IActivity, where: 'tail' | 'head') {
    if (this.maxActivityId === null || newActivity.id > this.maxActivityId) {
      this.maxActivityId = newActivity.id;
    }
    if (this.minActivityId === null || newActivity.id < this.minActivityId) {
      this.minActivityId = newActivity.id;
    }
    if (this.items.length > 0) {
      let guardActivity;
      if (where === 'tail') {
        guardActivity = this.items[this.items.length - 1];
      } else {
        guardActivity = this.items[0];
      }
      if (newActivity.verb === guardActivity.verb) {
        const verb = newActivity.verb;
        if (verb === 'upvote_question') {
          const newEvent = newActivity.event.content as UpvoteQuestion;
          const guardEvent = guardActivity.event.content as UpvoteQuestion;
          if (newEvent.question.uuid === guardEvent.question.uuid) {
            if (!guardEvent.subjects) {
              guardEvent.subjects = [guardEvent.subject];
            }
            guardEvent.subjects.push(newEvent.subject);
            return;
          }
        } else if (verb === 'upvote_submission') {
          const newEvent = newActivity.event.content as UpvoteSubmission;
          const guardEvent = guardActivity.event.content as UpvoteSubmission;
          if (newEvent.submission.uuid === guardEvent.submission.uuid) {
            if (!guardEvent.subjects) {
              guardEvent.subjects = [guardEvent.subject];
            }
            guardEvent.subjects.push(newEvent.subject);
            return;
          }
        } else if (verb === 'upvote_answer') {
          const newEvent = newActivity.event.content as UpvoteAnswer;
          const guardEvent = guardActivity.event.content as UpvoteAnswer;
          if (newEvent.answer.uuid === guardEvent.answer.uuid) {
            if (!guardEvent.subjects) {
              guardEvent.subjects = [guardEvent.subject];
            }
            guardEvent.subjects.push(newEvent.subject);
            return;
          }
        } else if (verb === 'upvote_article') {
          const newEvent = newActivity.event.content as UpvoteArticle;
          const guardEvent = guardActivity.event.content as UpvoteArticle;
          if (newEvent.article.uuid === guardEvent.article.uuid) {
            if (!guardEvent.subjects) {
              guardEvent.subjects = [guardEvent.subject];
            }
            guardEvent.subjects.push(newEvent.subject);
            return;
          }
        } else if (verb === 'follow_user') {
          const newEvent = newActivity.event.content as FollowUser;
          const guardEvent = guardActivity.event.content as FollowUser;
          if (newEvent.user.uuid === guardEvent.user.uuid) {
            if (!guardEvent.subjects) {
              guardEvent.subjects = [guardEvent.subject];
            }
            guardEvent.subjects.push(newEvent.subject);
            return;
          } else if (newEvent.subject.uuid === guardEvent.subject.uuid) {
            if (!guardEvent.users) {
              guardEvent.users = [guardEvent.user];
            }
            guardEvent.users.push(newEvent.user);
            return;
          }
        } else if (verb === 'create_article') {
          const newEvent = newActivity.event.content as CreateArticle;
          const guardEvent = guardActivity.event.content as CreateArticle;
          if (
            newEvent.subject.uuid === guardEvent.subject.uuid &&
            newEvent.article.uuid === guardEvent.article.uuid
          ) {
            // Prevent sequential publication event on timeline
            return;
          }
        } else if (verb === 'answer_question') {
          const newEvent = newActivity.event.content as AnswerQuestion;
          const guardEvent = guardActivity.event.content as AnswerQuestion;
          if (
            newEvent.subject.uuid === guardEvent.subject.uuid &&
            newEvent.answer.uuid === guardEvent.answer.uuid
          ) {
            // Prevent sequential publication event on timeline
            return;
          }
        } else if (verb === 'create_question') {
          const newEvent = newActivity.event.content as CreateQuestion;
          const guardEvent = guardActivity.event.content as CreateQuestion;
          if (
            newEvent.subject.uuid === guardEvent.subject.uuid &&
            newEvent.question.uuid === guardEvent.question.uuid
          ) {
            // Prevent sequential publication event on timeline
            return;
          }
        }
      }
    }
    if (where === 'tail') {
      this.items.push(newActivity);
    } else {
      this.items.splice(0, 0, newActivity);
    }
  }
}
