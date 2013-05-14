Landmark::Application.routes.draw do
  resources :properties
  root :to => 'home#index'
end
