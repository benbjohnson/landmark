module Api::V1
  class FlowStepsController < Api::V1::BaseController
    before_filter :find_flow

    # POST /api/v1/flows/:flow_id/steps
    def create
      @step = @flow.steps.build(params[:step])
      if @step.save
        render json: @step, status: :created
      else
        render json: @step.errors, status: :unprocessable_entity
      end
    end

    # PUT /api/v1/flows/:flow_id/steps/:id
    def update
      @step = @flow.steps.find(params[:id])

      if @step.update_attributes(params[:step])
        head :no_content
      else
        render json: @step.errors, status: :unprocessable_entity
      end
    end

    # DELETE /api/v1/flows/:flow_id/steps/:id
    def destroy
      @step = @flow.steps.find(params[:id])
      @step.destroy

      head :no_content
    end


    private

    def find_flow
      @flow = @project.flows.find(params[:flow_id])
    end
  end
end
