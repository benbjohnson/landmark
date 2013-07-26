Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :projects

  get '/track', :to => 'events#track'

  get "/signup" => "home#signup"
  root :to => 'home#index'
end
