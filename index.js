#!/usr/bin/env node
(function(){
var fs = require('fs')
var mkdirp = require('mkdirp')
var path = require('path')
var program = require('commander')
var readline = require('readline')
var MODE_0666 = parseInt('0666', 8)
var MODE_0755 = parseInt('0755', 8)
var sortedObject = require('sorted-object')
var package = require('./package.json')
var version = package.version
var _exit = process.exit
process.exit = exit 
function mkdir (path, fn) {
    mkdirp(path, MODE_0755, function (err) {
      if (err) throw err
      console.log('   \x1b[36mcreate\x1b[0m : ' + path)
      fn && fn()
    })
}

function exit (code) {
    function done () {
      if (!(draining--)) _exit(code)
    }
  
    var draining = 0
    var streams = [process.stdout, process.stderr]
  
    exit.exited = true
  
    streams.forEach(function (stream) {
      draining += 1
      stream.write('', done)
    })
  
    done()
  }

  
function copyTemplate (from, to) {
    from = path.join(__dirname, '', 'assets', from) ;
    write(to, fs.readFileSync(from, 'utf-8'))
}

function write (path, str, mode) {
    fs.writeFileSync(path, str, { mode: mode || MODE_0666 })
    console.log('   \x1b[36mcreate\x1b[0m : ' + path)
} 

function generate(path){
    var templates = {
        '_variables.scss'  :'/sass/_variables.scss' ,
        'base.scss'        :'/sass/components/base.scss' ,
        'header.scss'      :'/sass/components/header.scss' ,
        'common.scss'      :'/sass/components/common.scss' ,
        'footer.scss'      :'/sass/components/footer.scss' ,
        'app.scss'         :'/sass/app.scss' ,
        'gulpfile.js'      :'/gulpfile.js',
        'index.html'       :'/index.html',
        'app.js'           :'/js/app.js'
    }
    for( var file in templates){
        copyTemplate(file, path+templates[file]);
    }
}

function structure(name,path){
    mkdir(path+"/sass/components",function(){
        mkdir(path+"/css",function(){
            mkdir(path+"/fonts",function(){
                mkdir(path+"/img/assets",function(){
                    mkdir(path+"/img/temp",function(){
                        mkdir(path+"/js",function(){
                          _package(name,path);
                            generate(path);
                        })
                    });
                })
            })
        })
    })
    
}


program
.name('html-conversion')
.version(version, '    --version')
.parse(process.argv)

function main () {
    // Path
    var destinationPath = program.args.shift() || '.'
  
    // App name
    var appName = createAppName(path.resolve(destinationPath)) || 'hello-world'
    // Generate application
    emptyDirectory(destinationPath, function (empty) {
      if (empty || program.force) {
        createApplication(appName, destinationPath)
      } else {
        confirm('destination is not empty, continue? [y/N] ', function (ok) {
          if (ok) {
            process.stdin.destroy()
            createApplication(appName, destinationPath)
          } else {
            console.error('aborting')
            exit(1)
          }
        })
      }
    })
  }
  function emptyDirectory (path, fn) {
    fs.readdir(path, function (err, files) {
      if (err && err.code !== 'ENOENT') throw err
      fn(!files || !files.length)
    })
  }

  
  function createAppName (pathName) {
    return path.basename(pathName)
      .replace(/[^A-Za-z0-9.()!~*'-]+/g, '-')
      .replace(/^[-_.]+|-+$/g, '')
      .toLowerCase()
  }


  function confirm (msg, callback) {
    var rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    })
  
    rl.question(msg, function (input) {
      rl.close()
      callback(/^y|yes|ok|true$/i.test(input))
    })
  }
  
  
  function _package(name,path){
    var package = {
      name: name,
      version: '0.0.0',
      private: true,
      keywords : "sass,html,css,sass generator,generator sass",
      scripts: {
        start: 'gulp'
      },
      dependencies: {
        'gulp': '*',
        'gulp-sass': '*',
        'browser-sync': '*',
        'gulp-autoprefixer' : '*'
      }
    }
    package.dependencies = sortedObject(package.dependencies);
    write(path + '/package.json', JSON.stringify(package, null, 2) + '\n');
  }
  function f (name, path) {
    
    structure( name , path );
  }
if (!exit.exited) {
    main()
}

})();