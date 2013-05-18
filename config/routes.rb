Landmark::Application.routes.draw do
  devise_for :users
  resources :accounts
  resources :flows
  resources :traits
  resources :properties

  get '/signup' => 'accounts#new'
  post '/signup' => 'accounts#create'

  match '/track' => 'events#track'

  root :to => 'home#index'
end
