module Api::V1
  class FlowsController < Api::V1::BaseController
    # GET /api/v1/flows
    def index
      @flows = @project.flows.includes(:steps)
      render json: @flows.to_json(:include => :steps)
    end

    # GET /api/v1/flows/1
    def show
      @flow = @project.flows.includes(:steps).find(params[:id])
      render json: @flow.to_json(:include => :steps)
    end

    # POST /api/v1/flows
    def create
      @flow = @project.flows.build(params[:flow])
      if @flow.save
        render json: @flow, status: :created
      else
        render json: @flow.errors, status: :unprocessable_entity
      end
    end

    # PUT /api/v1/flows/1
    def update
      @flow = @project.flows.find(params[:id])

      if @flow.update_attributes(params[:flow])
        head :no_content
      else
        render json: @flow.errors, status: :unprocessable_entity
      end
    end

    # DELETE /api/v1/flows/1
    def destroy
      @flow = @project.flows.find(params[:id])
      @flow.destroy

      head :no_content
    end

    # GET /api/v1/flows/current
    def current
      if session[:current_flow_id].to_i == 0
        render json: {}
      else
        @flow = @project.flows.includes(:steps).find(session[:current_flow_id])
        render json: @flow.to_json(:include => :steps)
      end
    end

    # POST /api/v1/flows/set_current
    def set_current
      if params[:id].to_i == 0
        session[:current_flow_id] = 0
        render json: {}
      else
        @flow = @project.flows.includes(:steps).find(params[:id])
        session[:current_flow_id] = @flow.id
        render json: @flow.to_json(:include => :steps)
      end
    end
  end
end
