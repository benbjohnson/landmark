Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :projects do
    collection do
      get :auth
    end
  end

  resources :resources do
    collection do
      get :next_page_views
    end
  end

  get '/track', :to => 'events#track'

  get "/signup" => "home#signup"
  get "/pause" => "home#pause"
  root :to => 'home#index'
end
