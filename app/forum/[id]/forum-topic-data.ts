import { FORUM_CATEGORIES } from '@/lib/types';
import { getPosts, getTopic, getTopics, incrementTopicView } from '@/lib/db/forum';

export async function getForumTopicPageData(id: string) {
  const topic = await getTopic(id);
  if (!topic) {
    return { topic: null, comments: [], related: [], category: null };
  }

  // increment view count (non-blocking)
  incrementTopicView(id).catch(() => {});

  const comments = await getPosts(id);
  const category = FORUM_CATEGORIES.find((item) => item.slug === topic.category_slug) || null;
  const allCategoryTopics = await getTopics(topic.category_slug);
  const related = allCategoryTopics.filter((item) => item.id !== topic.id).slice(0, 3);

  return { topic, comments, related, category };
}
