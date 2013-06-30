Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :flows
  resources :actions, :only => [:index]
  resources :traits
  resources :properties, :except => [:edit, :update]

  get '/signup' => 'accounts#new'
  post '/signup' => 'accounts#create'

  match '/track' => 'events#track'
  match '/query' => 'events#query'

  root :to => 'home#index'
end
