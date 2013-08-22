class State < ActiveRecord::Base
  belongs_to :project
  belongs_to :parent, class_name: "State"
  has_many :children, class_name: "State", foreign_key: "parent_id"

  validates :name, :expression, presence: true  
  validates :name, uniqueness: {scope: :project_id}
  validates :parent_id, uniqueness: {scope: :project_id}

  attr_accessible(:name, :expression, :parent)
end
