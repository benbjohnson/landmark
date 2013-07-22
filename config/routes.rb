Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account

  resources :projects do
    resources :traits, :only => [:index, :destroy]
    resources :properties, :only => [:index, :destroy]
  end

  get '/track', :to => 'events#track'

  get "/signup" => "home#signup"
  root :to => 'home#index'
end
