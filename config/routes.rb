Landmark::Application.routes.draw do
  devise_for :users, :controllers => {:registrations => "registrations"}
  resource :account
  resources :projects do
    resources :flows
    resources :states
    resources :actions
  end

  resources :demos, :only => [:show]

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

        resources :actions do
          collection do
            get :query
            post :query
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

      resource :graph, :only => [] do
        collection do
          post :layout
        end
      end
    end
  end

  get "/signup" => "home#signup"
  root :to => 'home#index'
end
