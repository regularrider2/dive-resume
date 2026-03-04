# Static assets

**Resume:** The recommended way is to store your resume PDF in **Supabase Storage** (see **GO-LIVE-STEPS.md** → Step 1.5). The AI will set `resumePageUrl` in Part 3.

If you prefer to serve the PDF from the app instead, put **resume.pdf** here and set `content.meta.resumePageUrl` to `"/resume.pdf"` in `src/config/content.json`.
