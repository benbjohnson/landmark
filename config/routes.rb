Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :projects do
    resources :flows
    resources :states
  end

  resource :demo, :only => [:show] do
    get :pricing
    get :blog
    get :about
    get :contact
    get :signup
    get '/test/:id/edit', to: 'demos#test'
  end
  match "demo/signup/:plan" => 'demos#signup'

  namespace :api do
    namespace :v1 do
      resources :projects, :only => [] do
        collection do
          get :auth
          get :track
        end

        resources :states do
          collection do
            get :query
          end
        end
      end

      resources :flows do
        member do
          get :query
        end

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

      resources :states do
        collection do
          get :query
        end
      end
    end
  end

  get "/signup" => "home#signup"
  root :to => 'home#index'
end
