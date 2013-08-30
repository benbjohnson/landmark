class State < ActiveRecord::Base
  belongs_to :project
  has_many :source_links, class_name: "StateLink", foreign_key: "target_id"
  has_many :sources, :through => :source_links
  has_many :target_links, class_name: "StateLink", foreign_key: "source_id"
  has_many :targets, :through => :target_links

  validates :name, presence: true  
  validates :name, uniqueness: {scope: :project_id}

  attr_accessible(:name, :expression)

  # Generates a partial Sky query for the state change.
  def codegen()
    output = []

    source_condition = nil
    if sources.empty?
      # If there are no sources and no expression then it's a start state.
      if expression.blank?
        source_condition = "state == 0"

      # If there is an expression then just make sure it can't transition from itself.
      else
        source_condition = "state != #{id}"
      end

    # If we have sources then only use those.
    else 
      source_condition = sources.map {|source| "state == #{source.id}"}.join(" || ")
    end

    # The expression should default to "true" if not provided.
    expression_condition = !expression.blank? ? expression : "true"

    # Generate the condition.
    output << "WHEN (#{source_condition}) && (#{expression_condition}) THEN"
    output << "  SET prev_state = state"
    output << "  SET state = #{id}"
    output << "  SELECT count() AS count GROUP BY prev_state, state INTO 'transitions'"
    output << "END"

    return output.join("\n")
  end
end
