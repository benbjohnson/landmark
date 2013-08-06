Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :projects do
    resources :flows
    collection do
      get :auth
    end
  end

  get '/track', :to => 'events#track'

  resource :demo, :only => [:show] do
    get :pricing
    get :blog
    get :about
    get :contact
    get :signup
  end

  namespace :api do
    namespace :v1 do
      resources :flows do
        collection do
          get :current
          post :set_current
        end

        resources :steps, :controller => "flow_steps"
      end

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
