// src/jobs/syncQueue.js
import { performSyncJob } from "../controller/channel.controller.js";

// In-memory queue (FIFO). Replace with BullMQ later if needed.
const queue = [];
let running = false;

async function tick() {
  if (running) return;
  const job = queue.shift();
  if (!job) return;
  running = true;
  try {
    await performSyncJob(job);
  } catch (e) {
    console.error("[syncJob] error:", e.message);
  } finally {
    running = false;
    if (queue.length) setImmediate(tick);
  }
}

export async function addSyncJob(job) {
  queue.push(job);
  setImmediate(tick);
}
