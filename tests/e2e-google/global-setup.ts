import {
  assertGoogleOAuthConfigured,
  assertGoogleStorageStateExists,
} from './helpers/google-auth';

export default async function globalSetup() {
  await assertGoogleOAuthConfigured();
  assertGoogleStorageStateExists();
}
