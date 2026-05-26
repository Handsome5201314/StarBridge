-- StarBridge social generalization and AI-native MVP data model.

CREATE TABLE "LearnerProfile" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "ageBand" TEXT NOT NULL,
  "supportLevel" TEXT NOT NULL,
  "preferredVoice" TEXT NOT NULL,
  "toleratedModalities" JSONB NOT NULL,
  "promptPreference" TEXT NOT NULL,
  "generalizationGoals" JSONB NOT NULL,
  "notes" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "LearnerProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SceneAttempt" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "sceneId" TEXT NOT NULL,
  "levelId" TEXT NOT NULL,
  "promptLevel" TEXT NOT NULL,
  "targetSkill" TEXT NOT NULL,
  "currentStepId" TEXT NOT NULL,
  "completedStepIds" JSONB NOT NULL,
  "status" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "SceneAttempt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SceneStepEvent" (
  "id" TEXT NOT NULL,
  "attemptId" TEXT NOT NULL,
  "stepId" TEXT NOT NULL,
  "choiceId" TEXT NOT NULL,
  "accepted" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SceneStepEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "VoiceProfile" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "consentGranted" BOOLEAN NOT NULL,
  "purpose" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "VoiceProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SensorEvent" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "modality" TEXT NOT NULL,
  "metric" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "confidence" DOUBLE PRECISION NOT NULL,
  "recordedAt" TIMESTAMP(3) NOT NULL,
  "rawMediaStored" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "SensorEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AICoachArtifact" (
  "id" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "sceneId" TEXT NOT NULL,
  "artifact" JSONB NOT NULL,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AICoachArtifact_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LearnerProfile_sessionId_key" ON "LearnerProfile"("sessionId");
CREATE INDEX "SceneAttempt_sessionId_sceneId_idx" ON "SceneAttempt"("sessionId", "sceneId");
CREATE INDEX "SceneAttempt_sessionId_status_idx" ON "SceneAttempt"("sessionId", "status");
CREATE INDEX "SceneStepEvent_attemptId_createdAt_idx" ON "SceneStepEvent"("attemptId", "createdAt");
CREATE INDEX "VoiceProfile_sessionId_createdAt_idx" ON "VoiceProfile"("sessionId", "createdAt");
CREATE INDEX "SensorEvent_sessionId_recordedAt_idx" ON "SensorEvent"("sessionId", "recordedAt");
CREATE INDEX "SensorEvent_modality_metric_idx" ON "SensorEvent"("modality", "metric");
CREATE INDEX "AICoachArtifact_sessionId_sceneId_idx" ON "AICoachArtifact"("sessionId", "sceneId");

ALTER TABLE "LearnerProfile"
  ADD CONSTRAINT "LearnerProfile_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "FamilySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SceneAttempt"
  ADD CONSTRAINT "SceneAttempt_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "FamilySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SceneStepEvent"
  ADD CONSTRAINT "SceneStepEvent_attemptId_fkey"
  FOREIGN KEY ("attemptId") REFERENCES "SceneAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VoiceProfile"
  ADD CONSTRAINT "VoiceProfile_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "FamilySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SensorEvent"
  ADD CONSTRAINT "SensorEvent_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "FamilySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "AICoachArtifact"
  ADD CONSTRAINT "AICoachArtifact_sessionId_fkey"
  FOREIGN KEY ("sessionId") REFERENCES "FamilySession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
