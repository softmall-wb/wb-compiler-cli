# wb-compiler-cli

> A npm package style compiler-cli for softmall-wb-compiler

**NOTE:** This is a private repository, you need to pack and install after cloning。
## Get Started
### Clone this repository to your disk
``` shell
https://github.com/softmall-wb/wb-compiler-cli.git
```
### Pack & Install
``` shell
npm pack && npm i ./wb-compiler-cli-1.0.0.tgz
# or
npm run make-install
```

## Usage
You can easily use it with a softmall-vue project with some simple command.

```
Usage: wb-compiler-cli <path> [options]

Compile .vue to softmall format.

Options:

    -w, --watch         Watch changes, recompiling when its source files change
    -d, --development   Compile in development format, using with -p to generate both-side template
    -p, --production    Compile in production format, default is true
    --help              Output usage information
```