# spinup

A cli for creating basic projects, written with oclif

```
./bin/run
```
Will run the tool via a bootstrap script with a `node` hashbang.


```
npm install --save-dev eslint-plugin-prettier eslint-config-prettier
```
then add `"plugin:prettier/recommended"` as last item in `extends` in `.eslintrc`.

```
npm run build
```
cleans the `lib` folder then compiles the javascript in `lib`

```
npm run pack
```

Creates a pkg installer in `dist`.

```
sudo installer -pkg dist/macos/spinup-v0.0.0.pkg -target /
```

Install to `/usr/local/bin`

Alternatively, `npm link` to add the `spinup` command to PATH.


----

Updated to new oclif version 

`npm exec oclif pack macos` will build pkg installers for x64 and arm64 (needs `asdf local nodejs 16.16.0` to compile for ARM)

```
npm version 2.0.0-alpha3 #etc
```
