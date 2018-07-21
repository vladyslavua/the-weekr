import Dexie from 'dexie';

const indexedDB = new Dexie('TheWeekrDB');
indexedDB.version(1).stores({ todos: '++id', days: '++id, taskId, day' });

export default indexedDB;