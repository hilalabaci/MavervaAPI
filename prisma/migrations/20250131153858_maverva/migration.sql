-- CreateTable
CREATE TABLE "User" (
    "Id" SERIAL NOT NULL,
    "Email" TEXT NOT NULL,
    "Password" TEXT NOT NULL,
    "FullName" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Project" (
    "Id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "LeadUserId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Board" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "Key" TEXT NOT NULL,
    "ProjectId" INTEGER NOT NULL,
    "LeadUserId" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Board_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Backlog" (
    "Id" SERIAL NOT NULL,
    "BoardId" INTEGER NOT NULL,

    CONSTRAINT "Backlog_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Sprint" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "BoardId" INTEGER NOT NULL,
    "IsActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Sprint_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Column" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,
    "BoardId" INTEGER NOT NULL,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Issue" (
    "Id" SERIAL NOT NULL,
    "Key" TEXT NOT NULL,
    "Summary" TEXT NOT NULL,
    "Description" TEXT,
    "Status" TEXT NOT NULL DEFAULT 'To Do',
    "Type" TEXT NOT NULL DEFAULT 'Task',
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ProjectId" INTEGER NOT NULL,
    "UserId" INTEGER,
    "LabelId" INTEGER,
    "BoardId" INTEGER,
    "ColumnId" INTEGER NOT NULL,
    "BacklogId" INTEGER,
    "SprintId" INTEGER,

    CONSTRAINT "Issue_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "Label" (
    "Id" SERIAL NOT NULL,
    "Name" TEXT NOT NULL,

    CONSTRAINT "Label_pkey" PRIMARY KEY ("Id")
);

-- CreateTable
CREATE TABLE "UserProject" (
    "UserId" INTEGER NOT NULL,
    "ProjectId" INTEGER NOT NULL,

    CONSTRAINT "UserProject_pkey" PRIMARY KEY ("UserId","ProjectId")
);

-- CreateTable
CREATE TABLE "UserIssue" (
    "UserId" INTEGER NOT NULL,
    "IssueId" INTEGER NOT NULL,

    CONSTRAINT "UserIssue_pkey" PRIMARY KEY ("UserId","IssueId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_Email_key" ON "User"("Email");

-- CreateIndex
CREATE UNIQUE INDEX "Project_key_key" ON "Project"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Board_Id_key" ON "Board"("Id");

-- CreateIndex
CREATE UNIQUE INDEX "Board_Key_key" ON "Board"("Key");

-- CreateIndex
CREATE UNIQUE INDEX "Backlog_BoardId_key" ON "Backlog"("BoardId");

-- CreateIndex
CREATE UNIQUE INDEX "Issue_Key_key" ON "Issue"("Key");

-- CreateIndex
CREATE UNIQUE INDEX "Label_Name_key" ON "Label"("Name");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Board" ADD CONSTRAINT "Board_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Backlog" ADD CONSTRAINT "Backlog_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sprint" ADD CONSTRAINT "Sprint_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_ColumnId_fkey" FOREIGN KEY ("ColumnId") REFERENCES "Column"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_BacklogId_fkey" FOREIGN KEY ("BacklogId") REFERENCES "Backlog"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_SprintId_fkey" FOREIGN KEY ("SprintId") REFERENCES "Sprint"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_BoardId_fkey" FOREIGN KEY ("BoardId") REFERENCES "Board"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Issue" ADD CONSTRAINT "Issue_LabelId_fkey" FOREIGN KEY ("LabelId") REFERENCES "Label"("Id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserProject" ADD CONSTRAINT "UserProject_ProjectId_fkey" FOREIGN KEY ("ProjectId") REFERENCES "Project"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIssue" ADD CONSTRAINT "UserIssue_UserId_fkey" FOREIGN KEY ("UserId") REFERENCES "User"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserIssue" ADD CONSTRAINT "UserIssue_IssueId_fkey" FOREIGN KEY ("IssueId") REFERENCES "Issue"("Id") ON DELETE RESTRICT ON UPDATE CASCADE;
