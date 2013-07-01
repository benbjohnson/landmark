Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :flows
  resources :actions, :only => [:index]
  resources :traits
  resources :properties, :except => [:edit, :update]

  get '/track', :to => 'events#track'
  post '/query', :to => 'events#query'

  root :to => 'home#index'
end
