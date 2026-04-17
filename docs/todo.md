# TODO list

- When syncing activities with Strava, fetch only those that are relevant to the training plan (e.g. runs, trail runs) and for the dates that the training plan covers.

- **Strava one-account-per-athlete enforcement**: currently the platform allows the same Strava account to be re-linked to a different internal athlete, which re-assigns all existing activities to the new athlete. This is fine for single-user testing but needs proper handling before multi-user production use. Options: (1) block re-linking and require the original athlete to disconnect first, (2) copy rather than re-link activities so both athletes retain their own records, (3) enforce a unique constraint at the athlete level and surface a clear error in the UI when a Strava account is already in use.
