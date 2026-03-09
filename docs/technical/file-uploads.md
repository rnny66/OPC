# OPC Platform — File Uploads

## Overview

File uploads use **Supabase Storage** with Row-Level Security (RLS) policies for access control. Currently, the only upload feature is player avatar images.

## Avatar Upload

### Storage Configuration

| Property | Value |
|----------|-------|
| Bucket | `avatars` |
| Visibility | Public (anyone can read) |
| Path pattern | `{user_id}/avatar.{ext}` |
| Migration | `supabase/migrations/004_avatar_storage.sql` |

### RLS Policies

| Operation | Rule |
|-----------|------|
| **SELECT** | Public — anyone can read avatar files |
| **INSERT** | Authenticated users can upload to their own `{user_id}/` folder |
| **UPDATE** | Users can overwrite files in their own folder |
| **DELETE** | Users can delete files in their own folder |

Policy implementation uses `(bucket_id = 'avatars') AND (auth.uid()::text = (storage.foldername(name))[1])` to scope writes to the authenticated user's folder.

### Upload Flow

```
ProfileForm (Client Component)
  ├── User selects image file via <input type="file" />
  ├── Preview shown as circular thumbnail
  ├── On form submit:
  │   ├── Generate path: `{user_id}/avatar.{ext}`
  │   ├── Upload via createBrowserClient().storage.from('avatars').upload(path, file, { upsert: true })
  │   ├── Get public URL via getPublicUrl(path)
  │   └── Save URL to profiles.avatar_url via .update()
  └── Page refreshes to show new avatar
```

### Key Implementation Details

- **`upsert: true`** — overwrites existing avatar without needing to delete first
- **File extension** extracted from the uploaded file's name
- **Public URL** returned by `getPublicUrl()` is a stable URL that doesn't change between uploads (same path)
- **No file size limit enforced client-side** — Supabase default limits apply (50MB)
- **No image type validation client-side** — accepts any file the `<input>` allows

### Files

| File | Role |
|------|------|
| `platform/components/profile/profile-form.tsx` | Client Component with upload UI and Supabase Storage calls |
| `platform/app/(player)/profile/page.tsx` | Server Component shell, fetches current profile |
| `supabase/migrations/004_avatar_storage.sql` | Bucket creation + RLS policies |

## Future Considerations

- **Image optimization** — resize/compress before upload or use Supabase image transforms
- **File type validation** — restrict to common image formats (JPEG, PNG, WebP)
- **File size limit** — enforce a reasonable max (e.g., 2MB) client-side
- **Tournament images** — Phase 3 may add organizer-uploaded tournament banners (separate bucket)
