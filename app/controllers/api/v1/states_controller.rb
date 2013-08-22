module Api::V1
  class StatesController < Api::V1::BaseController
    # GET /projects/:id/states/query
    def query
      @root = @project.states.where("parent_id IS NULL").first
      return render json: {} if @root.nil?

      query = []
      query << "DECLARE state AS INTEGER"
      query << codegen(@root)
      query = query.join("\n")
      results = @project.run_query(query: query)

      json  = "{"
      json += "\"states\":#{@project.states.to_json(only: [:id, :name, :parent_id])},"
      json += "\"results\":#{results.to_json}"
      json += "}"
      render :json => json
    end

    private

    # Recursively generates the query for a given state.
    def codegen(state)
      output = []

      output << "WHEN state == #{state.parent_id.to_i} && #{state.expression} THEN"
      output << "  SET state = #{state.id}"
      output << "  SELECT count() AS count INTO '#{state.id}';"
      output << "END"

      state.children.each do |child|
        output << codegen(child)
      end

      return output.join("\n")
    end
  end
end
