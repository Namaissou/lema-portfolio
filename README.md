# LEMA — Personal Portfolio

A responsive, multi-page portfolio built with plain HTML, CSS and JavaScript. No framework or build step is required.

## Pages
- `index.html` — introduction, services, experience and contact details.
- `about.html` — background, skills and training/certifications.
- `projects.html` — network simulation and server configuration projects.
- `design.html` — public graphic design gallery.
- `admin.html` — authenticated artwork upload and deletion interface.

## Run locally
Open `index.html` in a browser, or run a local static server from this folder (for example, `python -m http.server 8000`) and visit `http://localhost:8000`.

## Enable online artwork uploads (Supabase)
The portfolio is a static site. To make uploads appear publicly and across devices, it needs a storage backend. This project uses Supabase Storage and Supabase Auth. The upload manager intentionally does not pretend that a browser-only upload is public or permanent.

1. Create a project at https://supabase.com/.
2. In **Storage**, create a bucket named `portfolio-designs`. Set it to **Public** so the gallery can display images. Keep upload/delete operations restricted by policies below.
3. In **Project Settings → API**, copy the Project URL and the **anon/publishable** key into `js/supabase-config.js`. Do not paste a `service_role` or secret key into browser code.
4. In **Authentication → Users**, create your own user account. Keep public sign-ups disabled if you do not want others creating accounts.
5. In the Supabase SQL Editor, run the following policies (they assume the bucket is named `portfolio-designs`):

```sql
-- Public visitors can list gallery images. Public bucket URLs are readable by design.
create policy "Public can list portfolio artwork"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'portfolio-designs');

-- Signed-in users can upload. For a personal portfolio, only create accounts you control.
create policy "Authenticated portfolio uploads"
on storage.objects for insert
to authenticated
with check (bucket_id = 'portfolio-designs');

-- Signed-in users can remove artwork from the gallery.
create policy "Authenticated portfolio deletes"
on storage.objects for delete
to authenticated
using (bucket_id = 'portfolio-designs');
```

**Security note:** these example policies allow any authenticated account in the Supabase project to upload/delete. Since this portfolio does not expose public registration, only create accounts you control. For stricter production access, add an admin role/allow-list policy using your own verified Supabase user UUID and restrict insert/delete to that UUID.

6. Deploy the entire folder to Netlify, GitHub Pages, or another static host. Preserve the folder structure. Configure the site domain in Supabase Auth URL settings if needed.
7. Open `admin.html`, sign in, and upload images. They will appear in `design.html` after upload.

## Important customisation checklist
- Add your real LinkedIn and GitHub profile URLs in `index.html` (the current links go to the platform home pages).
- Add real project screenshots and repository links when ready; do not claim a project is deployed if it is not.
- Replace or add project descriptions only if they accurately reflect your work.
- Keep your resume PDF private unless you intentionally want to publish it.
- The resume says the bachelor's coursework is complete and the graduation ceremony is scheduled for November 2026; the site wording reflects that rather than claiming the ceremony has already happened.
- Add web projects by copying the `web-project-row` article in `projects.html`. Update its screenshot path and alt text, title, description, technologies, and live project URL.
- Replace `images/cisco.jpg` and `images/Servidor web.jpg` with your own networking and server project screenshots when ready.

## Design approach
Clear typography, considered spacing, a restrained green-and-neutral palette, hand-built CSS compositions and custom project illustrations. A theme toggle switches between light and dark appearances and remembers the visitor’s choice.
