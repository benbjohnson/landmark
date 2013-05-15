Landmark::Application.routes.draw do
  devise_for :users
  resources :properties
  match '/track' => 'events#track'
  root :to => 'home#index'
end
