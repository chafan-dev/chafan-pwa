import dayjs from 'dayjs';

import 'dayjs/locale/zh-cn';

import utc from 'dayjs/plugin/utc';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

export default dayjs;
