Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :projects do
    collection do
      get :auth
    end
  end

  get '/track', :to => 'events#track'

  namespace :api do
    namespace :v1 do
      resources :flows

      resources :resources do
        collection do
          get :next_page_actions
        end
      end
    end
  end

  get "/signup" => "home#signup"
  root :to => 'home#index'
end
