Landmark::Application.routes.draw do
  devise_for :users
  resources :properties
  root :to => 'home#index'
end
