# DragnChat

Open source 'drag n drop' chat with graph-based context.

## TODO

- [ ] Deployment
    - [ ] Remove extra stuff I dont need.
    - [ ] Vercel setup
    - [ ] Database setup
    - [ ] Tidy up build process (reference what Theo does)
- [ ] UI
    - [x] Setup shadcn
    - [ ] Scaffold
        - [ ] Header (likely just an avatar that is top-4 right-4)
        - [ ] User Profile Dropdown (just logout and login based on state for now. clerk is tempting for the <SignedIn /> and <SignedOut /> components)
        - [ ] Project Selector (Probably a dialogue, i might try breadcrumbs with a dropdown actually)
        - [ ] Chat graph node
        - [ ] node connection
    - [ ] Live (database attached)
        - [ ] User login and auth
        - [ ] Connection to projects view
        - [ ] Active project chat information
- [ ] Auth
    - [ ] Remove discord auth
    - [ ] Google Auth if I can get the oauth approved in time, this may be a reason to use clerk.
- [ ] OpenRouter API client
    - [ ] Store user key in db
    - [ ] Async task execution queue, no chron though

## Misc - will do

- [ ] Ratelimiting (upstash? or something else free?)
- [ ] "taint" (server-only package, look into this)

## Misc - probably not

- [ ] Use Next/Image component (debating this, probably dont need)
- [ ] Error management (w/ Sentry)
- [ ] Parallel route for projects?
- [ ] Analytics (posthog)