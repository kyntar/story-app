// src/scripts/utils/db-helper.js

import { openDB } from 'idb';

const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(database) {
    database.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'id' });
  },
});

const DbHelper = {
  async getAllStories() {
    console.log('Mengambil semua cerita dari IndexedDB...');
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async putStory(story) {
    if (!story.id) return;
    console.log(`Menyimpan cerita (ID: ${story.id}) ke IndexedDB...`);
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    console.log(`Menghapus cerita (ID: ${id}) dari IndexedDB...`);
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },
};

export default DbHelper;