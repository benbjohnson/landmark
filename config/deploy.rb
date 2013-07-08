require "rvm/capistrano"
require 'bundler/capistrano'

set :application, "landmark"
set :user, 'landmark'

set :scm, :git
set :repository, 'git@github.com:skylandlabs/landmark.git'
set :branch, 'master'

set :use_sudo, false
set :rvm_install_with_sudo, false

role :web, 'landmark.io'
role :app, 'landmark.io'
role :db, 'landmark.io', :primary => true

default_run_options[:pty] = true
ssh_options[:forward_agent] = true
ssh_options[:port] = 25000

# if you want to clean up old releases on each deploy uncomment this:
before 'deploy:setup', 'rvm:install_rvm'
after "deploy:restart", "deploy:cleanup"

# If you are using Passenger mod_rails uncomment this:
namespace :deploy do
  task :start do ; end
  task :stop do ; end
  task :restart, :roles => :app, :except => { :no_release => true } do
    run "#{try_sudo} touch #{File.join(current_path,'tmp','restart.txt')}"
  end
end
        require './config/boot'
        require 'airbrake/capistrano'
