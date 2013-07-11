Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account

  resources :projects do
    resources :flows, :only => [:index] do
      collection do
        get :view
      end
    end

    resources :actions, :only => [:index]
    resources :traits
    resources :properties, :except => [:edit, :update]
    
    member do
      post :query
    end
  end

  get '/track', :to => 'events#track'

  root :to => 'home#index'
end
