Landmark::Application.routes.draw do
  devise_for :users
  resources :accounts
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
