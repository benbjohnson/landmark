Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account

  resources :projects do
    resources :flows, :only => [:index] do
      collection do
        get :view
      end
    end

    resources :traits
    resources :properties, :except => [:edit, :update]
    
    member do
      post :query
    end
  end

  get '/track', :to => 'events#track'

  get "/signup" => "home#signup"
  root :to => 'home#index'
end
