Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :projects do
  end

  resources :resources do
    collection do
      get :next_page_views
    end
  end

  get '/track', :to => 'events#track'

  get "/signup" => "home#signup"
  root :to => 'home#index'
end
