# tasker

How to use:

1. Fork this repo.
2. Clone forked repo.
3. `npm i` will install all dependencies.
4. `gulp` will run the default command and start the server.
5. visit the website at http://localhost:3000/

Feeling lazy guide:

1. go to http://lenderprice-tasker.herokuapp.com/

NOTES:
* if the heroku link brings you to a `https` url, remember to `load unsafe scripts` in your browser, or remove the `s` to go to a normal `http` site.

KNOWN BUGS:
1. parameters `name` and `description` don't work when creating tasks. I've successfully created tasks by providing `summary` in data. my created tasks don't seem to retain the `status`.
2. can only assign tasks to newly created taskers, and not those that previously existed prior to this exercise.
