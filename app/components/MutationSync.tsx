"use client";

import { useEffect } from "react";
import { startMutationSync } from "../../lib/offlineQueue";

export default function MutationSync() {
  useEffect(() => startMutationSync(), []);
  return null;
}
