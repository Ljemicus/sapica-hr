import type { Metadata } from 'next';

import { buildForumMetadata } from '../page';
import ForumPage from '../page';

export const metadata: Metadata = buildForumMetadata('en');

export default ForumPage;
