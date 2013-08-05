Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :projects do
    resources :flows, :only => [:index, :show]
    collection do
      get :auth
    end
  end

  resources :resources do
    collection do
      get :next_page_actions
    end
  end

  get '/track', :to => 'events#track'

  get "/signup" => "home#signup"
  root :to => 'home#index'
end
