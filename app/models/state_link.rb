class StateLink < ActiveRecord::Base
  belongs_to :source, class_name: "State"
  belongs_to :target, class_name: "State"
  validates :source_id, :target_id, presence: true  
  attr_accessible(:source, :target)
end
