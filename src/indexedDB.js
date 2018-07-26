import Dexie from 'dexie';

const indexedDB = new Dexie('TheWeekrDB');
indexedDB.version(1).stores({ todos: '++id, archived', days: '++id, taskId, day' });

export default indexedDB;